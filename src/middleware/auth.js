import db from "../js/db";
import { SignJWT, decodeJwt, jwtVerify } from "jose";

/**
 * create an access token if credentials are correct
 * @param {Request} req the request with credentials
 * @param {object} pool The pool connection
 * @returns {Response} the response if the user has logged in or not
 */
async function auth(req, pool, headers) {
  try {
    const { username, password } = await req.json();

    // check for credentials if they exists or not
    const usernameExist = await db.existUser(pool, username);
    const passwordExist = await Bun.password.verify(
      password,
      await db.getUserPassword(pool, username),
    );

    // return error if credentials are invalid
    if (!usernameExist || !passwordExist) {
      return new Response("Invalid Credentials !", {
        status: 401,
        headers: headers,
      });
    }

    // create the payload
    const payload = {
      username: username,
      // password: password
    };

    const secret = new TextEncoder().encode(
      await db.getUserToken(pool, username),
    ); // needed UTF-8

    // create the token
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    if (token !== null) {
      headers.append("Content-Type", "application/json");
      return new Response(JSON.stringify({ token: token }), {
        status: 200,
        headers: headers,
      });
    }

    return new Response("Error while loging in", {
      status: 401,
      headers: headers,
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * Function that will check the given token in the request and verify if it is valid
 * @param {Request} req the request
 * @returns {Response} the response if the token is valid or not
 */
async function checkToken(req, pool, headers) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // extract the token from auth header

    if (!token) {
      return new Response({ status: 401, headers: headers });
    }

    const decoded = decodeJwt(token);

    // check expiration timestamp
    if (Math.floor(Date.now() / 1000) > decoded.exp) {
      return new Response(
        JSON.stringify({
          valid: false,
          exp_time: decoded.exp,
        }),
        {
          status: 401,
          headers: headers,
        },
      );
    }

    if (!decoded || !decoded.username) {
      return new Response("User not found", { status: 401, headers: headers });
    }

    const userKey = new TextEncoder().encode(
      await db.getUserToken(pool, decoded.username),
    ); // needed UTF-8

    const verified = await jwtVerify(token, userKey);

    if (!verified) {
      return new Response(
        JSON.stringify({
          valid: false,
        }),
        {
          status: 401,
          headers: headers,
        },
      );
    }

    const responseJson = {
      valid: true,
      exp_time: decoded.exp,
      username: decoded.username,
    };

    return new Response(JSON.stringify(responseJson), {
      status: 200,
      headers: headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: headers,
    });
  }
}

export default { auth, checkToken };
