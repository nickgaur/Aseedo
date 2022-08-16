const business = require('../../Model/businessOwners/business');
const businessDetailsModel = require('../../Model/businessOwners/business');
const { cloudinary } = require('../../cloudinary/videoStorage');

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
                res.render('Services/BusinessOwner/agreement', { id });
            }
            else {
                console.log("You have already signed agreement");
                res.json({status: "OK", message: "You have already signed Agreement!"});
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
            const isAgreed = business.videoAgreement;
            if (!isAgreed) {
               const videoAgreement = {
                    url: req.file.path,
                    filename: req.file.filename,
                };
                await businessDetailsModel.findByIdAndUpdate(id, { videoAgreement });
                res.redirect('/signup/businessowner');
            }
            else {
                console.log("You have already signed agreement");
                res.json({status: "OK", message: "You have already signed Agreement!"});
            }
        }
        else {
            console.log(`no business is registered with id: ${id}`);
            res.json({status: 'Unauthorized',message:`No Business is registered with id: ${id}`});
        }
    }
    catch (err) {
        console.log(err)
        res.redirect('/signup/businessowner');
    }


}