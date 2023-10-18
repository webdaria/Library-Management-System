-- not needed for Microsoft SQL 
-- CREATE DATABASE LIBRARY ;
-- USE LIBRARY ;

/*Creating table to store book details */
CREATE TABLE Book (
    bookName VARCHAR(500) NOT NULL,
    edition VARCHAR(50),
    language CHAR(50),
    year INT,
    bookid VARCHAR(30) PRIMARY KEY ,
    rating DECIMAL(3,1),
    genre VARCHAR(50),
	author VARCHAR (50),
	quantity INT CHECK (quantity > 1)
);

/*inserting data on book table */
INSERT INTO Book(bookName, edition, language, year, bookid, rating, genre,author,quantity)
VALUES
    ('The Hobbit', 'First Edition', 'English', 1937, '9780007497904', 4.2, 'Fantasy', 'J.R.R.Tolkien',5),
    ('Harry Potter and the Philosopher''s Stone', 'First Edition', 'English', 1997, '9780747532699', 4.5, 'Fantasy','J.K. Rowling',15),
    ('Alice in Wonderland', 'Revised Edition', 'English', 1865, '9781503290283', 4.1, 'Fantasy','Lewis Carroll',18),
    ('The Chronicles of Narnia', 'Complete Collection', 'English', 1950, '9780064404990', 4.6, 'Fantasy','C.S. Lewis',10),
    ('Pride and Prejudice', 'Revised Edition', 'English', 1813, '9780141439518', 4.7, 'Classic','Jane Austen',15),
    ('To Kill a Mockingbird', 'First Edition', 'English', 1960, '9780062420701', 4.5, 'Fiction','Harper Lee',16),
    ('The Great Gatsby', 'First Edition', 'English', 1925, '9780743273565', 4.2, 'Classic','F. Scott Fitzgerald',18),
    ('1984', 'Revised Edition', 'English', 1949, '9780451524935', 4.3, 'Dystopian','George Orwell',20),
    ('The Catcher in the Rye', 'First Edition', 'English', 1951, '9780316769488', 4.0, 'Fiction','J.D. Salinger',20),
    ('Moby-Dick', 'Revised Edition', 'English', 1851, '9781503280789', 4.4, 'Adventure',' Herman Melville',20);

/*Creating table to store person details */
CREATE TABLE Person 
(personid INT PRIMARY KEY,
 email CHAR(200));

/*Inserting Records in pErson table*/
INSERT INTO Person (personid,email)
VALUES
    (1, 'johndoe@example.com'),
    (2, 'janesmith@example.com'),
    (3, 'michaeljohnson@example.com'),
    (4, 'emilydavis@example.com'),
    (5, 'davidwilson@example.com'),
    (6, 'sarahbrown@example.com'),
    (7, 'christopherlee@example.com'),
    (8, 'oliviataylor@example.com'),
    (9, 'danielanderson@example.com'),
    (10,'sophiamartinez@example.com');

/*Userinfo table*/
 CREATE TABLE Userinfo 
(email CHAR(200) PRIMARY KEY,
 Personname CHAR(50) NOT NULL );

 /*Inserting Records*/
INSERT INTO Userinfo ( email, personname)
VALUES
    ('johndoe@example.com', 'John Doe'),
    ('janesmith@example.com', 'Jane Smith'),
    ('michaeljohnson@example.com', 'Michael Johnson'),
    ('emilydavis@example.com', 'Emily Davis'),
    ('davidwilson@example.com', 'David Wilson'),
    ('sarahbrown@example.com', 'Sarah Brown'),
    ('christopherlee@example.com', 'Christopher Lee'),
    ('oliviataylor@example.com', 'Olivia Taylor'),
    ('danielanderson@example.com', 'Daniel Anderson'),
    ('sophiamartinez@example.com', 'Sophia Martinez');

/*Fine table*/
CREATE table Fine
(transactionid INT PRIMARY KEY, 
 fineamt DECIMAL);

 /* insert Recors for fine table */ 
 insert into fine (transactionid,fineamt) 
 values
 (1,5),
 (2,5),
 (3,5),
 (4,3), 
 (5,4), 
 (6,0),
 (7,1),
 (8,0),
 (9,2),
 (10,0);

/*Action table */
CREATE TABLE Action
(transactionid INT PRIMARY KEY IDENTITY(1,1), 
 bookid VARCHAR(30),
 personid INT, 
 borrowdate DATE, 
 returndate DATE,
 FOREIGN KEY (Bookid) REFERENCES Book(Bookid) ON DELETE CASCADE ON UPDATE CASCADE,
 FOREIGN KEY (personid) REFERENCES Person(personid) ON DELETE CASCADE ON UPDATE CASCADE) ;

 /* inserting records */
insert into Action (bookid , personid,borrowdate,returndate)
VALUES ('9780062420701'	,1,'2023-05-25',NULL), 
('9780064404990',1,'2023-05-25',NULL),
('9780062420701',1,'2023-05-25',NULL),
('9780062420701',1,'2023-05-25',NULL),
('9780062420701',4,'2023-05-25',NULL),
('9780062420701',1,'2023-05-25',NULL),
('9780062420701',1,'2023-05-25','2023-05-25'),
('9780062420701',3,'2023-05-25',NULL),
('9780062420701',1,'2023-05-25','2023-05-30'),
('9780062420701',2,'2023-05-25',NULL);


/*function to check books availability */
CREATE FUNCTION BookExists(@bookID VARCHAR(30))
RETURNS BIT
AS
BEGIN
    DECLARE @exists BIT;
    
    -- Check if the user ID exists in the Users table
    IF EXISTS (SELECT 1 FROM Book WHERE bookid = @bookID and quantity > 0 )
        SET @exists = 1;
    ELSE
        SET @exists = 0;
    
    RETURN @exists;
END;
GO


/*function to authorise user */
CREATE FUNCTION UserExists(@userID INT)
RETURNS BIT
AS
BEGIN
    DECLARE @exists BIT;
    
    -- Check if the user ID exists in the Users table
    IF EXISTS (SELECT 1 FROM Person WHERE personid = @userID)
        SET @exists = 1;
    ELSE
        SET @exists = 0;
    
    RETURN @exists;
END;
GO

/*Trigers when book returned past 30 days of borrowdate */
CREATE TRIGGER CalculateFineTrigger
ON Action
AFTER UPDATE
AS
BEGIN
    -- Check if the returndate is updated
    IF UPDATE(returndate)
    BEGIN
        -- Insert into the Fine table for each updated row that meets the condition
        INSERT INTO Fine (transactionid, fineamt)
        SELECT i.transactionid, 
            CASE WHEN DATEDIFF(day, i.borrowdate, i.returndate) > 30
                 THEN DATEDIFF(day, i.borrowdate, i.returndate) - 30
                 ELSE 0
            END AS fineamt
        FROM inserted i
        INNER JOIN Action a ON i.transactionid = a.transactionid;
    END;
END;


