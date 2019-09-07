import { app } from "apprun";

import { CV_PAGE_URL } from "~pages/cv";
import { HOME_PAGE_URL } from "~pages/home";
import { RESEARCH_PAGE_URL } from "~pages/research";

import "./style.scss";

const Header = () => {
	return <>
		<nav className="navbar navbar-expand-lg sticky-top navbar-light bg-website">
			<a className="navbar-brand" href={HOME_PAGE_URL} $prettylink>Lindsay M. Tedds</a>
			<button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			</button>
			<div className="collapse navbar-collapse" id="navbarResponsive">
				<ul className="navbar-nav ml-auto">
					<li className="nav-item">
						<a className="nav-link" href={HOME_PAGE_URL} $prettylink>Home</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" href={CV_PAGE_URL} $prettylink>CV</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" href={RESEARCH_PAGE_URL} $prettylink>Research</a>
					</li>
				</ul>
			</div>
		</nav>
		<div className="header-website-bottom"></div>
	</>;
};
export default Header;
