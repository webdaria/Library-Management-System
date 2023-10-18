
const randomBookImages = [
  "flat-tree.jpeg",
  "defaultBook.jpeg",
  "strangeBook.jpeg",
  "potter.jpeg"
];

//get random images 

function random_item(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//reload  page with all contents from database 
function onPageLoad(){
    searchBooks()
}

//keeps track of clicked bookId 
bookId = null

//opens the popup for borrowing 
function openBrrForm(bookId) {
  document.getElementById("borrow-form").style.display = "block"; 
}

//close the popup for borrowing 
function closeBrrForm() {
  document.getElementById("borrow-form").style.display = "none";
}

//open  the popup for returning 
function openForm() {
document.getElementById("return-form").style.display = "block";
}

//close the popup for returning
function closeForm() {
  document.getElementById("return-form").style.display = "none";
}

//jquery starts here
$(document).ready(() => {
    window.onload = searchBooks();
  //handles search function 
  $('#searchBtn').click(() => {
    console.log('Button clicked');
    const bookName = $('#bookname').val();
    const author = $('#author').val();
    const genre = $('#genre').val();
    searchBooks(bookName, author, genre);
  });

  //called when burrow button is called on popup
  $('#brrBtn').click(() => {
    const uId = parseInt($('#uid').val());
    Authorise(bookId,uId)
  });

  //called when burrow button is called from bookList
  $('#stockBooks').on('click', '.brw', function() {
   
    bookId = $(this).closest('div.book').data('book-id');
    openBrrForm()
  });

  function searchBooks(bookName, author, genre) {
    console.log('Search book with name:' + bookName + author + genre);
    $('#stockBooks').empty();
    $.ajax({
      url: `/search`,
      method: 'GET',
      data: { 
        "bookName": bookName, 
        "author": author, 
        "genre": genre
      },
      success: function(response) {
        console.log("jjhjhj")
        //handles empty search 
        if(response ==="book not found"){
          var bookHtml =  " <h1> Sorry No books found </h1>"
        }
        else{
          var books = response;
          var bookHtml = '';
          for (let i = 0; i < books.length; i++) {
              const bookImage = random_item(randomBookImages);
              bookHtml += '<div class="card book " data-book-id="'+ books[i].bookid + '">';
              bookHtml += `<img src="img/books/${bookImage}" class="card-img-top" alt="Herper LEE">`;
              bookHtml += '<div class="card_body">'

              bookHtml += '<h5 class = "card-title">'+ books[i].bookName + '</h5> </br>';
             
              bookHtml += '<p>Author:<span>'+books[i].author+'</span></p> '; 
              bookHtml += '<p>Genre:<span>'+books[i].genre+'</span></p> ';
              bookHtml += '<p>Rating:<span>'+books[i].rating+'</span></p> ';
              var quantity = books[i].quantity - 2 
              bookHtml += '<p>Available Quantity:<span>'+quantity +'</span></p> </div> <div class= "buttons"> ';
              
              if(books[i].quantity > 2){
                bookHtml += '<button class=" brw btn btn-green">Borrow </button> </div> </div> </div>';
              }
             else{
                bookHtml += '<button class =" btn btn-grey">Out of Stock</button></div></div> </div>';
              }
          }
        }
        
        $('#stockBooks').html(bookHtml);
        
      },
      error: function(xhr, status, error) {
        console.error('Error:', error);
      }
    });
  }
  
  //checks authorised user before borrowing 
  function Authorise(bookId,uId){
    closeBrrForm()

       $.ajax({
      url: `/borrow`,
      method: 'GET',
      data: { 
        "uId": uId, 
        "bookId":bookId
      },
      success: function(response) {
        Swal.fire(
          response
        )
        searchBooks()
      }
    
  })
  }
})


