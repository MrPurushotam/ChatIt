
function storeVerificationCode(map, email, code, expiryTime = 150000) {
    const expire = Date.now() + expiryTime;
    map.set(email, { code, expire });
    setTimeout(() => {
        map.delete(email);
    }, expiryTime)
}

function storeForgotPasswordCode(map, email, code, expiryTime = 150000) {
    const expire = Date.now() + expiryTime;
    map.set(email, { code, expire });
    setTimeout(() => {
        map.delete(email);
    }, expiryTime)
}

function validateVerificationCode(map, email, code) {
    const data = map.get(email);
    if (!data) {
        return { success: false, message: "Verification code has expired or not generated.", verified: false };
    }
    if (data.expire < Date.now()) {
        return { success: false, message: "Verification code has expired.", verified: false };
    }
    if (data.code === code) {
        return { success: true, message: "Verfication code is valid.", verified: true }
    }
    return { success: false, message: "Invalid verification code.", verified: false };
}


function validateForgotPasswordCode(map, email, code) {
    const data = map.get(email);
    if (!data) {
        return { success: false, message: "Verification code has expired or not generated." };
    }
    if (data.expire < Date.now()) {
        return { success: false, message: "Verification code has expired." };
    }
    if (parseInt(data.code) === parseInt(code)) {
        return { success: true, message: "Verfication code is valid." }
    }
    return { success: false, message: "Invalid verification code." };
}

function deleteCodePostUpdate(map, email) {
    if (map.get(email)) {
        map.delete(email);
    }

}

module.exports = { storeForgotPasswordCode, validateForgotPasswordCode, validateVerificationCode, storeVerificationCode, deleteCodePostUpdate };