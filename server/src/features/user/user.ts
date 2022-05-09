import moment from "moment";
import * as jwt from "jsonwebtoken";

export class User {
    guid: string;
    createdAt: string;
    updatedAt: string;

    email: string;
    passwordHash: string;

    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    region: string;
    postalCode: string;
}


export function getClientUser(user: User) {
    let fields = [];
    let obj = {};
    for(let field of fields)
        obj[field] = user[field];
    return obj;
}

export async function generateToken(userGuid: string) {
    var tokenExpires = moment().add("1", "year").unix();

    var token = jwt.sign({
        exp: tokenExpires,
        data: { user: { guid: userGuid } }
    }, process.env.JWT_SECRET);
    
    return { token, tokenExpires };
}