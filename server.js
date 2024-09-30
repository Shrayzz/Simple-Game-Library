import { serve } from "bun";
import path from "path";
import jwt from "jsonwebtoken";
import db from "./src/js/db"


// // middleware functions
import register from "./src/middleware/register";
// import { auth, checkAuth } from "./src/middleware/auth";

// token for sessions so when expired user is disconnected ? to generate and store in DB
// https://bun.sh/guides/util/hash-a-password


const server = serve({
    async fetch(req) {

        const con = await db.dbConnect('localhost', 'root', 'root');
        await db.dbInit();

        const url = new URL(req.url);

        // routes
        if (req.method === 'GET' && url.pathname === "/" /* && jwt.verify */) {
            return new Response(Bun.file(path.join(__dirname, "public", "html", "index.html")));
            // } else if (!req.session.loggedin) {
            //     return new Response(Bun.file(path.join(__dirname, "src", "public", "html", "login.html")));

        }

        // GET routes
        if (req.method === 'GET' && url.pathname === "/login") return new Response(Bun.file(path.join(__dirname, "public", "html", "login.html")));
        if (req.method === 'GET' && url.pathname === "/register") return new Response(Bun.file(path.join(__dirname, "public", "html", "register.html")));
        if (req.method === 'GET' && url.pathname === "/myspace") return new Response(Bun.file(path.join(__dirname, "public", "html", "space.html")));

        // POST routes
        // if (req.method === 'POST' && url.pathname === "/api/auth") return await auth(req);
        if (req.method === 'POST' && url.pathname === "/api/register") {
            console.log('ok');
            return await register(req, con);

        }
        // get files in public directory
        const fpath = path.join(__dirname, "src", "public", url.pathname.substring(1));
        const file = Bun.file(fpath);

        // return public file if it exist
        if (await file.exists()) {
            return new Response(file);
        }

        return new Response("Not found", { status: 404 });
    },
    port: 3000
});

console.log(`Server Running at ${server.url.href}`);

