const Fee = require('../model/fee');

// GET /fee/:studentId
exports.getFeeDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const feeDetails = await Fee.findOne({ studentId });

        if (!feeDetails) return res.status(404).json({ message: 'Fee details not found' });

        res.status(200).json({
            success: true,
            feeDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch fee details' });
    }
};

// POST /fee
exports.addFee = async (req, res) => {
    try {
        const { studentId, feeAmount, dueDate } = req.body;

        const existingFee = await Fee.findOne({ studentId });
        if (existingFee) return res.status(400).json({ message: 'Fee details already exist for this student' });

        const fee = new Fee({
            studentId,
            feeAmount,
            dueDate
        });

        await fee.save();
        res.status(200).json({
            success: true,
            message: 'Fee details added successfully',
            fee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add fee details' });
    }
};

// PUT /fee/payment/:studentId
exports.makePayment = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { paidAmount } = req.body;

        const fee = await Fee.findOne({ studentId });

        if (!fee) return res.status(404).json({ message: 'Fee details not found' });

        fee.paidAmount += paidAmount;
        fee.dueAmount = fee.feeAmount - fee.paidAmount;

        // Update payment status based on due amount
        if (fee.dueAmount === 0) {
            fee.paymentStatus = 'paid';
        } else if (new Date() > fee.dueDate && fee.dueAmount > 0) {
            fee.paymentStatus = 'overdue';
        } else {
            fee.paymentStatus = 'pending';
        }

        fee.updatedAt = Date.now();

        await fee.save();

        res.status(200).json({
            success: true,
            message: 'Payment made successfully',
            fee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to make payment' });
    }
};

// PUT /fee/update/:studentId
exports.updateFee = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { feeAmount, dueDate } = req.body;

        const fee = await Fee.findOne({ studentId });

        if (!fee) return res.status(404).json({ message: 'Fee details not found' });

        fee.feeAmount = feeAmount;
        fee.dueDate = dueDate;
        fee.dueAmount = feeAmount - fee.paidAmount;
        fee.updatedAt = Date.now();

        await fee.save();

        res.status(200).json({
            success: true,
            message: 'Fee details updated successfully',
            fee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update fee details' });
    }
};

// GET /fee/all
exports.getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find();
        res.status(200).json({
            success: true,
            fees
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch fee details' });
    }
};
