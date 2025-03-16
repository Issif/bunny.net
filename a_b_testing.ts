import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk";
import {getCookies} from "https://deno.land/std/http/cookie.ts";
import process from "node:process";

/**
 * When a response is not served from the cache, you can use this event handler
 * to modify the response going from the origin.
 * This modify the response before being cached.
 *
 * Returns an HTTP response.
 * @param {Context} context - The context of the middleware.
 * @param {Request} request - The current request done to the origin.
 * @param {Response} response - The HTTP response or string.
 */
async function onOriginResponse(context: { request: Request, response: Response }): Promise<Response | void> {
    const body = await context.response.text();
    const headers = new Headers(context.response.headers);

    headers.has("version") ? headers.set("Set-Cookie", headers.get("version")) : null

    return new Response(body, {
        status: context.response.status,
        headers,
    });
}

/**
 * When a response is not served from the cache, you can use this event handler
 * to modify the request going to the origin.
 *
 * @param {Context} context - The context of the middleware.
 * @param {Request} context.request - The current request.
 */
async function onOriginRequest(context: { request: Request }): Promise<Request | void> {
    const cookies = getCookies(context.request.headers);
    if (cookies["version"] == null) {
        if (Math.floor(Math.random() * 100) > process.env.A_B_RATIO) {
            cookies["version"] = process.env.VERSION_A;
        } else {
            cookies["version"] = process.env.VERSION_B;
        }
    }

    context.request.headers.set("version", cookies["version"]);

    return Promise.resolve(context.request);
}

BunnySDK.net.http.servePullZone()
    .onOriginRequest(onOriginRequest)
    .onOriginResponse(onOriginResponse);
