// middleware.js
import {
	withMiddlewareAuthRequired,
	getSession,
} from "@auth0/nextjs-auth0/edge";
import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired({
	returnTo: "/api/auth/login",
	// Custom middleware is provided with the `middleware` config option
	async middleware(req) {
		return NextResponse.next();
	},
});
