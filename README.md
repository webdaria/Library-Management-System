# libraryManagementSystem

This app provides user-friendly interface to the library users to search , borrow and return books. It uses HTM/CSS/JQUERY/ JavaScript /Nodejs and Microft SQL 

**To run this project** 
install nodejs 

`git clone git@github.com:sunitagajurel/libraryManagementSystem.git`

cd libraryManagementSystem 

`npm install` 
This will install all the required libraries like (mssql,express js ) to run the project in the local

Create Database in MicroSoft Azure : https://docs.microsoft.com/en-us/learn/modules/provision-azure-sql-db/Links to an external site.

Run all the queries given in the queries.sql file  in Microsft SQL in Azure

create .env file with following contents in the root folder, give all the details from your azure sql database : 

`DB_USER = <DBUSERNAME>
PASSWORD = <PASSWORD> 
DATABASE = <DATABASENAME>  
SERVER = <SERVERNAME>
PORT = 1433 `


run `node app.js`  

