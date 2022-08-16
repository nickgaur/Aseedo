const express = require('express');
const router = express.Router();
const businessDetailsModel = require("../Model/businessOwners/business")
const sgMail = require('@sendgrid/mail')

router
    .route('/')
    .get((req, res) => {
        res.render("verification/verification");
    })
    .post(async (req, res) => {
        const { email } = req.body;
        try {
            const business = await businessDetailsModel.findOne({ email });
            // ================================
            if(business.videoAgreement){
                if (!business.isVerified){
                    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                const msg = {
                    to: business.email, // Change to your recipient
                    from: process.env.EMAIL, // Change to your verified sender
                    subject: 'Verification required for Aseedo',
                    // text: `hello`,
                    html: `Click on the link below to verify your Aseedo Account\n https://aseedo.herokuapp.com/verify/${process.env.SERVER_SECRET}/user/${business._id}`,
                }
                sgMail
                    .send(msg)
                    .then(() => {
                        console.log('Email sent')
                        res.status(200).redirect(`/verify/${process.env.SERVER_SECRET}/user`);
                    })
                    .catch((error) => {
                        console.error(error)
                    })
                }
                else {
                    res.redirect(`/verify/${process.env.SERVER_SECRET}/user/${business._id}`);
                }

            }
            else{
                res.redirect(`/signup/businessowner/${business._id}/agreement`);
            }
            // ================================
            
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ status: "Email Not Registered" });
        }
    })

router
    .route("/:id")
    .get(async (req, res) => {
        try {
            const { id } = req.params;
            const business = await businessDetailsModel.findById(id);
            if (!business.isVerified) {
                await businessDetailsModel.findByIdAndUpdate(id, { isVerified: true });
                res.status(200).render("verification/verified")
            }
            else {
                res.status(200).render("verification/verified")
            }

        }
        catch (err) {
            console.log(err);
            res.status(400).json({ status: "error" });
        }
    })


module.exports = router;