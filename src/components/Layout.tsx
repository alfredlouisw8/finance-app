import Link from "next/link";

export default function Layout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className="p-4  border-b-2">
				<div className="container flex justify-between">
					<Link href="/">
						<p>Logo</p>
					</Link>
					<p>Profile</p>
				</div>
			</div>

			<div className="p-4 container">{children}</div>
		</>
	);
}
