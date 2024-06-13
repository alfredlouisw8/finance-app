import BackButton from "@/components/BackButton";
import AddUserForm from "./_components/AddUserForm";

export default async function Page() {
	return (
		<div className="container mx-auto px-5">
			<BackButton />
			<AddUserForm />
		</div>
	);
}
