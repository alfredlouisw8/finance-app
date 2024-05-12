//@ts-nocheck
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import EmailProvider, {
	SendVerificationRequestParams,
} from "next-auth/providers/email";
import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions, Theme } from "next-auth";
import { createTransport } from "nodemailer";
import { Role } from "@/types/User";
import { CustomPrismaAdapter } from "./custom-prisma-adapter";

export const authOptions: NextAuthOptions = {
	adapter: CustomPrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
			allowDangerousEmailAccountLinking: true,
		}),
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: process.env.EMAIL_SERVER_PORT,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
			sendVerificationRequest: customSendVerificationRequest,
		}),
	],
	callbacks: {
		async session({ session, token, user }) {
			if (session?.user) {
				session.user.role = user.role ?? Role.ADVISOR;
				session.user.id = user.id;
				session.user.isAdmin = user.isAdmin;
			}

			return session;
		},
	},
};

function html(params: { url: string; host: string; theme: Theme }) {
	const { url, host, theme } = params;

	const realUrl = url.split("+")[0];

	const escapedHost = host.replace(/\./g, "&#8203;.");

	const brandColor = theme.brandColor || "#346df1";
	const color = {
		background: "#f9f9f9",
		text: "#444",
		mainBackground: "#fff",
		buttonBackground: brandColor,
		buttonBorder: brandColor,
		buttonText: theme.buttonText || "#fff",
	};

	return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${realUrl}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
	return `Sign in to ${host}\n${url}\n\n`;
}

async function customSendVerificationRequest({
	identifier: email,
	url,
	provider,
	theme,
}: SendVerificationRequestParams) {
	const { host } = new URL(url);

	// NOTE: You are not required to use `nodemailer`, use whatever you want.
	const transport = createTransport(provider.server);

	const [realEmail, role] = email.split(" ");

	let isExist;

	if (role === Role.ADVISOR) {
		isExist = await prisma.advisor.findUnique({
			where: {
				email: realEmail,
			},
		});
	} else if (role === Role.CLIENT) {
		isExist = await prisma.client.findUnique({
			where: {
				email: realEmail,
			},
		});
	}

	if (!isExist) {
		throw new Error("Not registered in db");
	}

	const result = await transport.sendMail({
		to: realEmail,
		from: provider.from,
		subject: `Sign in to ${host}`,
		text: text({ url, host }),
		html: html({ url, host, theme }),
	});
	const failed = result.rejected.concat(result.pending).filter(Boolean);
	if (failed.length) {
		throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
	}

	await prisma.verificationToken.updateMany({
		where: {
			identifier: email,
		},
		data: {
			identifier: realEmail,
		},
	});

	try {
		const user = await prisma.user.update({
			where: {
				email: realEmail,
			},
			data: {
				role: role,
			},
		});
	} catch (error) {
		console.log(error);
	}
}
