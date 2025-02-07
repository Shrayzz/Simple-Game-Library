import "dotenv/config";

const bnetID = process.env.BNET_CLIENT_ID;

import auth from "../js/auth/auth";
import register from "../js/auth/register";
import profile from "../js/utils/profile"
import passwd from "../js/utils/forgot-passwd"
import lists from "../js/utils/lists"
import blizzard from "../js/api/blizzard";
import steam from "../js/api/steamapi";


/**
 * Router function for SimpleGameLibrary api endpoints
 * @param {Request} req the request
 * @param {string} url the requested url
 * @param {Object} pool the database pool connectecion
 * @param {Headers} headers the headers    
 */
async function apiRouter(req, url, pool, headers) {
  if (req.method === "GET" && url.pathname === "/api/getUserImage")
    return await profile.getUserImage(pool, url, headers);
  if (req.method === "GET" && url.pathname === "/api/getUserLists")
    return await lists.getUserLists(pool, url, headers);
  if (req.method === "GET" && url.pathname === "/api/getUserFavoriteGames")
    return await lists.getUserFavoriteGames(pool, url, headers);
  if (req.method === "GET" && url.pathname === "/api/logout")
    return await auth.logout(req, headers);
  if (req.method === "POST" && url.pathname === "/api/auth")
    return await auth.auth(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/register")
    return await register(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/forgot-password")
    return await passwd.emailForgot(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/reset-password")
    return await passwd.resetPassword(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/updateUsername")
    return await profile.updateUsername(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/deleteAccount")
    return await profile.deleteAccount(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/updateUserImage")
    return await profile.updateImage(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/addList")
    return await lists.addList(req, pool, headers);
  if (req.method === "POST" && url.pathname === "/api/addGameToFavorite")
    return await lists.addGameToFavorite(pool, req, headers);
  if (req.method === "POST" && url.pathname === "/api/deleteFavoriteGame")
    return await lists.deleteGameFromFavorite(pool, req);
  return null;
}

/**
 * Router function for blizzard's endpoints
 * @param {Request} req the request
 * @param {string} url the url
 * @param {Headers} headers the headers
 * @returns {Promise<Response>} response Object
 */
async function blizzardRouter(req, url, headers) {
  if (req.method === "GET" && url.pathname === "/api/blizzard/link")
    return blizzard.handleOAuthRequest(bnetID, "http://localhost:3000/profile", [
      "d3.profile",
      "wow.profile",
      "sc2.profile",
      "openid",
    ]);

  if (req.method === "POST" && url.pathname === "/api/blizzard/token")
    return await blizzard.getAccessToken("http://localhost:3000/profile", req);

  if (req.method === "POST" && url.pathname === "/api/blizzard/check")
    return await blizzard.checkAccessToken(req);

  if (req.method === "GET" && url.pathname === "/api/blizzard/wow/profile")
    return await blizzard.getWowCharacter(req, headers);

  return null;
}

/**
 * Router function for steam's endpoints
 * @param {Request} req the request
 * @param {string} url the url
 * @param {Headers} headers the headers
 * @returns {Promise<Response>} response Object
 */
async function steamRouter(req, url, headers) {
  if (req.method === "GET" && url.pathname === "/api/steam/apps")
    return await steam.GetApps(headers);

  if (req.method === "GET" && url.pathname === "/api/steam/appdetail") {
    const appid = url.searchParams.get("appid");
    if (!appid) return new Response(JSON.stringify({ message: "appid is required" }, { status: 400 }));
    return await steam.GetAppDetails(appid, headers);
  }

  if (req.method === "GET" && url.pathname === "/api/steam/ownedgames") {
    const steamid = url.searchParams.get("steamid");
    if (!steamid) return new Response(JSON.stringify({ message: "steamid is required" }, { status: 400 }));
    return await steam.GetOwnedGames(steamid, headers);
  }

  if (req.method === "GET" && url.pathname === "/api/steam/friends") {
    const steamid = url.searchParams.get("steamid");
    if (!steamid) return new Response(JSON.stringify({ message: "steamid is required" }, { status: 400 }));
    return await steam.GetFriends(steamid, headers);
  }

  if (req.method === "GET" && url.pathname === "/api/steam/playersummary") {
    const steamid = url.searchParams.get("steamid");
    if (!steamid) return new Response(JSON.stringify({ message: "steamid is required" }, { status: 400 }));
    return await steam.GetPlayerSummary(steamid, headers);
  }

  if (req.method === "GET" && url.pathname === "/api/steam/playerachievements") {
    const steamid = url.searchParams.get("steamid");
    const appid = url.searchParams.get("appid");
    if (!steamid || !appid) return new Response(JSON.stringify({ message: "steamid and appid are required" }, { status: 400 }));
    return await steam.GetPlayerAchievements(steamid, appid, headers);
  }

  if (req.method === "GET" && url.pathname === "/api/steam/achievementdata") {
    const appid = url.searchParams.get("appid");
    if (!appid) return new Response(JSON.stringify({ message: "steamid is required" }, { status: 400 }));
    return await steam.GetAchievementsData(appid, headers);
  }

  return null;
}

export default { apiRouter, blizzardRouter, steamRouter };
