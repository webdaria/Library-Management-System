require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const bodyParser = require('body-parser');
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password:process.env.PASSWORD,
    server:process.env.SERVER,
    port:1433,
    database: process.env.DATABASE, 
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false}));

  // Route to fetch a book by ID
  function getCurrentDay (){
    const cdate = new Date();

    let day = cdate.getDate();
    let month = cdate.getMonth() + 1;
    let year = cdate.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${year}-${month}-${day}`;

    return currentDate
  }

  function getDueDate() {

    
    var ddate = new Date() 
    //setting duedate to be 30 day fron now
    ddate.setDate(ddate.getDate() + 30);
    let dday = ddate.getDate();
    let dmonth = ddate.getMonth() + 1;
    let dyear = ddate.getFullYear();

    let dueDate=`${dyear}-${dmonth}-${dday}`;
    return dueDate

  }

  app.get('/borrow', async (req, res) => {

    try {
      const uId = req.query.uId;
      const bookId = req.query.bookId;
      console.log(uId,bookId)
      var pool = await sql.connect(config)

      // checks the availability of the book 
      const query = `SELECT dbo.BookExists(${bookId})`
      console.log(query) 
      const booksqty = await pool.request().input('bookid',sql.VARCHAR(30),bookId).query(`SELECT dbo.BookExists(@bookid)`)
      const book = booksqty .recordset[0]
      const bookExists= Object.values(book)[0]

      //checks  the valid user 
      if (bookExists == 1){
        const result = await pool.request().query(`SELECT dbo.UserExists(${uId}) `);
        console.log(result)
        const obj = result.recordset[0]
        const userExists= Object.values(obj)[0]
        if (userExists) {
            const currentDate = getCurrentDay();
            const dueDate = getDueDate();
            const transaction = new sql.Transaction(pool);

            // creating the transaction so that the changes are only reflected after it is commited"
          
            await transaction.begin()
            try {
                // creating the transaction 
                await transaction.request().input('bookid',sql.VARCHAR(30),bookId).input('borrowdate', sql.Date,currentDate)
               .input('returndate',sql.Date, null).query(`
                  INSERT INTO Action (bookid, personid, borrowdate, returndate)
                  VALUES (@bookid,${uId},@borrowdate ,@returndate)
                `);

                console.log("transaction -inserted")

                // reducing the number of book 
                await transaction.request().input('bookid',sql.VARCHAR(30),bookId).query(`
                UPDATE Book SET quantity = quantity - 1 WHERE bookid = @bookid
              `);
                //getting the transaction detail 
                const getTransactionId= await transaction.request().query(`
                  SELECT TOP (1) transactionid, bookid FROM Action ORDER BY transactionid DESC
                `);
                await transaction.commit()
                    res.send(`your transaction ID is ${getTransactionId.recordset[0].transactionid} and book id is ${getTransactionId.recordset[0].bookid} please keep it secure , you won't be able to return it without these info`);
            }
            catch (error) {
              await transaction.rollback()
              throw error;
            }  
        } 
        else{
            res.send("Sorry !  You are not authorised!")
        }
      }
    
      else{
        res.send("Sorry ! The book is out of stock , Check back again later")
      }

      }
      catch (error) {
          console.error('Error:', error);
          res.send("Something went wrong!!");
    } finally {
      // Close the database connection
      await pool.close();
    }
  });


  app.post('/return', async (req, res) => {
    console.log("requesthit")
    try {
      
      const tId = req.body.tid;
      const bookId = req.body.bid;
      console.log(tId,bookId)
      
      // Connect to the database
      var pool = await sql.connect(config);

      // check if the person is authorised 
      const result = await pool.request().input('bookid',sql.VARCHAR(30),bookId).query(`
      SELECT * from action where transactionId= ${tId} and bookid = @bookid and returndate is NULL`)

      console.log(result)
      
      if (result.recordset.length == 1) {
        const transaction = new sql.Transaction(pool);

        await transaction.begin()
        try {
            // set the return date 
            await transaction.request().input('returndate',sql.Date, getCurrentDay()).query(
              `Update action set returndate = @returndate where bookid = ${bookId} and transactionid = ${tId}`)

              console.log("updating transaction")
            
            // update  the  quantity
            await transaction.request().input('bookid',sql.VARCHAR(30),bookId).query(
                `UPDATE Book SET quantity = quantity + 1 WHERE bookid = @bookid`)

              //commiting the transaction
            await transaction.commit()
            res.send("book returned successfully")

          }
        catch(err){
          await transaction.rollback()
          res.send("err")
        }
      }
      else {
        // Transaction not found
        res.status(404).send('Transaction  not found! Make sure you entered the correct information');
      }
    }
     catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the database connection
      
      await pool.close();
    }
  });


    // Route to fetch a book by ID
    app.get('/search', async (req, res) => {
      try {
        const bookName = req.query.bookName;
        const author = req.query.author;
        const genre = req.query.genre;

        let query = 'SELECT * FROM book WHERE 1=1';
        if(bookName) {
          query = query + ` and bookName = '${bookName}'`;
        }

        if(author) {
          query = query + ` and author = '${author}'`;
        }

        if(genre) {
          query = query + ` and genre = '${genre}'`;
        }
        
        // query += "and quantity > 0"
        // Connect to the database
        await sql.connect(config);
    
        console.log(query)
        // Query to fetch a book by ID
        await sql.query(query).then(result => {
          if (result.recordset.length > 0) {
            // Book found, send the book data as a JSON response
            console.log(result.recordset)
            res.json(result.recordset);
          }
          else{
            res.send("book not found");
          }

        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      } finally {
        // Close the database connection
        await sql.close();
      }
    });
  

 // Serve the HTML file when the root URL is requested
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
