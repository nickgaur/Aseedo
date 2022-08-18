const businessDetailsModel = require('../../Model/businessOwners/business');
const sgMail = require('@sendgrid/mail');

module.exports.renderSignupForm = (req, res) => {
    res.render('Services/BusinessOwner/signUpForm');
}

module.exports.postBusinessOwnerSignUpForm = async (req, res) => {
    const formData = req.body;
    try {
        formData.shopImage = req.files.map((f) => {
            return {
                url: f.path,
                filename: f.filename,
            };
        });
        await businessDetailsModel.insertMany(formData);
        const email = formData.email;
        const business = await businessDetailsModel.findOne({ email });
        const id = business._id;
        res.redirect(`/signup/businessowner/${id}/agreement`);
    }
    catch (error) {
        console.log(error);
        res.redirect('/signup/businessowner');
    }
}

module.exports.renderAgreementForm = async (req, res) => {
    const { id } = req.params;
    try {
        const business = await businessDetailsModel.findById(id);
        if (business) {
            const isAgreed = business.videoAgreement;
            if (!isAgreed) {
                res.render('Services/BusinessOwner/agreement', { business });
            }
            else {
                console.log("You have already signed agreement");
                res.json({ status: "OK", message: "You have already signed Agreement!" });
            }
        }
        else {
            console.log(`No business is registered with given id ${id}`);
            res.redirect('/signup/businessowner');
        }
    }
    catch (err) {
        console.log(err);
        res.redirect('/signup/businessowner');
    }
}

module.exports.postAgreementForm = async (req, res) => {
    const { id } = req.params;
    try {
        const business = await businessDetailsModel.findById(id);
        if (business) {
            const isVideoUploaded = business.videoAgreement;
            if (!isVideoUploaded) {
                const videoAgreement = {
                    url: req.file.path,
                    filename: req.file.filename,
                };
                await businessDetailsModel.findByIdAndUpdate(id, { videoAgreement });
                sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                const msg = {
                    to: business.email,
                    from: process.env.EMAIL,
                    subject: 'Verification required for Aseedo',
                    html: `Click on the link below to verify your Aseedo Account\n https://aseedo.herokuapp.com/verify/${process.env.SERVER_SECRET}/user/${business._id}`,
                }
                await sgMail
                    .send(msg)
                    .then(() => {
                        console.log('Email sent')
                        req.flash('success', `we have sent you verification mail on ${business.email}`);
                        res.redirect(`/verify/${process.env.SERVER_SECRET}/user`);
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            }
            else {
                console.log("You have already signed agreement");
                res.json({ status: "OK", message: "You have already signed Agreement!" });
            }
        }
        else {
            console.log(`No business is registered with id: ${id}`);
            res.json({ status: 'Unauthorized', message: `No Business is registered with id: ${id}` });
        }
    }
    catch (err) {
        console.log(err)
        res.redirect('/signup/businessowner');
    }


}