
const express = require("express");
const multer = require("multer");

const Circular = require("../model/circular");


const path = require('path');
const fs = require('fs');






exports.postCircular = async (req, res) => {
    try {
        console.log("Files received:", req.files); // ✅ Debugging line

        const { title, description, types, schoolEmail } = req.body;

        if (!title || !description || !types || !schoolEmail) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let filePaths = [];

        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                console.log("Processing file:", file.originalname); // ✅ Debugging line
                filePaths.push(file.path); // ✅ File path ko save kar rahe hain
            });
        }

        const newCircular = new Circular({
            title,
            description,
            types: JSON.parse(types),
            schoolEmail,
            attachments: filePaths,  // ✅ Ab correct field save ho rahi hai
        });

        await newCircular.save();
        res.status(201).json({ message: "Circular created successfully", newCircular });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.getCircular = async (req, res) => {
    try {
        // Read schoolEmail from query parameters
        const schoolEmail = req.query.schoolEmail;
        let query = {};
        if (schoolEmail) {
            query.schoolEmail = schoolEmail;
        }

        // Find circulars based on the query
        const circulars = await Circular.find(query);
        res.status(200).json({ success: true, circulars });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};


// ❌ Delete a Circular
exports.deleteCircular = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const circularDetails = await Circular.findOne({ _id: id });
        if (!circularDetails) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        await Circular.findByIdAndDelete(id);
        res.status(200).json({ message: "Circular deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};