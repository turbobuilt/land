import { FastifyInstance } from "fastify";
import { insert, queryOne, update } from "../../lib/db";
import { generateToken, getClientUser, User } from "./user";
import bcrypt from "bcrypt";


export async function createUserRoutes(app: FastifyInstance) {
    app.post("/user", async function(req, reply) {
        let body = req.body as any;
        let { email, password } = body;
        let validationResult = validateEmail(email);
        if(validationResult !== true)
            return reply.status(400).send({ error: validationResult });
        let existingUser = await queryOne("SELECT * FROM user WHERE email=? LIMIT 1", [email]);
        if(existingUser && existingUser.passwordHash)
            return reply.status(400).send({ error: "Your account has already been created.  Please log in!", code: "ACCOUNT_EXISTS" });

        let user = existingUser || { email };
        if(password) {
            if(password.length < 8)
                return reply.status(400).send({ error: "Your password must be at least 8 characters long for security reasons.  We don't want your account to get hacked because your password is too short or too easy to guess!" });
            user.passwordHash = await bcrypt.hash(password, 10);
        }
        if(existingUser) {
            try {
                await update("user", user);
            } catch (err) {
                console.error("Error inserting user", err);
                return reply.status(400).send({ error: err.message });
            }
        } else {
            try {
                await insert("user", user);
            } catch (err) {
                console.error("Error creating user", err);
                return reply.status(400).send({ error: err.message });
            }
        }
        if(user.passwordHash)
            return reply.send({
                user: getClientUser(user),
                token: await generateToken(user.guid)
            });
        else
            return { email: user.email };
    });
    app.get("/user", function(req, reply) {

    });
    app.put("/user", function(req, reply) {

    });
    app.delete("/user", function(req, reply) {

    });
}

export async function createLoginRoutes(app: FastifyInstance) {
    app.post("/login", async function(req, reply) {
        let { email, password } = req.body as any;
        if(!email) return reply.status(400).send({ error: "An email address is required" });
        if(!password) return reply.status(400).send({ error: "A password is required" });
        let user = await queryOne("SELECT * FROM user WHERE email=? LIMIT 1", [email]);
        if(!user) return reply.status(400).send({ error: "Invalid email or password" });
        if(!user.passwordHash) return reply.status(400).send({ error: "Your account has not been set up yet.  Please create an account!  Thank you for your interest in our product!" });
        if(!await bcrypt.compare(password, user.passwordHash)) return reply.status(400).send({ error: "Invalid password" });
        return reply.send({
            user: getClientUser(user),
            token: await generateToken(user.guid)
        });
    });
    app.get("/logout", function(req, reply) {

    });
    app.post("/reset-password", function(req, reply) {

    });
    app.post("/request-password-reset", function(req, reply) {

    });
}

export function validateEmail(email: string) {
    if(typeof email !== "string")
        return "Email is not valid. It must be text.";
    if(email.length < 10)
        return "Email must be 10 characters long at minimum";
    if(!email.match(/^.+@.+\..+/))
        return "Email is not valid. It must be a valid email address. It must contain an @ and a period.";
    return true;
}