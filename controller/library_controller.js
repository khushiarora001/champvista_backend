const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");

const app = express();
app.use(express.json());

// 📌 Book Schema
const issuedBookSchema = new mongoose.Schema({
    bookName: String,
    issueDate: Date,
    returned: Boolean,
    studentName: String,
    claassName: String,
    SectionId: String,
    SectionName: String,
    classId: String,
    studentId: mongoose.Schema.Types.ObjectId,
});

const IssuedBook = mongoose.model("IssuedBook", issuedBookSchema);

// ✅ 1️⃣ **Fetch Issued Books for a Student**
// ✅ Fetch Issued Books for a Student
app.get("/issued-books/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const issuedBooks = await IssuedBook.find({ studentId });

        res.json({ success: true, issuedBooks });
    } catch (error) {
        console.error("❌ Error fetching issued books:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// ✅ 2️⃣ **Issue a New Book**
// ✅ Issue a New Book with Student Details
app.post("/issue-book", async (req, res) => {
    try {
        const { bookName, studentId, studentName, className, sectionName } = req.body;
        if (!bookName || !studentId || !studentName || !className || !sectionName) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newIssuedBook = new IssuedBook({
            bookName,
            issueDate: new Date(),
            returned: false,
            studentId,
            studentName,
            className,  // ✅ Added className
            sectionName // ✅ Added sectionName
        });

        await newIssuedBook.save();
        res.json({ success: true, message: "Book issued successfully", book: newIssuedBook });
    } catch (error) {
        console.error("❌ Error issuing book:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ 3️⃣ **Mark a Book as Returned**
// ✅ Return a Book with Student Name, Class, and Section
app.put("/return-book/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        const updatedBook = await IssuedBook.findByIdAndUpdate(
            bookId,
            { returned: true },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.json({
            success: true,
            message: "Book returned successfully",
            book: updatedBook
        });
    } catch (error) {
        console.error("❌ Error returning book:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ 4️⃣ **Fetch All Issued Books (Admin)**
app.get("/all-issued-books", async (req, res) => {
    try {
        const allBooks = await IssuedBook.find();
        res.json({ success: true, issuedBooks: allBooks });
    } catch (error) {
        console.error("❌ Error fetching all issued books:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 📌 Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
