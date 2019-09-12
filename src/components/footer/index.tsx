import { app } from "apprun";

import "./style.scss";

export const THIS_LICENSE_URL = "/LICENSE.txt";
export const THIRD_PARTY_LICENSES_URL = "/licenses.txt";

const Footer = () => (
		<>
			<footer className="bg-website">
				<div className="container">
					<p className="m-0 text-center">Copyright &copy; 2019 Lindsay Tedds and Gillian Petit - <a href={THIS_LICENSE_URL}>Some Rights Reserved</a></p>
				</div>
			</footer>
		</>
	);
export default Footer;
