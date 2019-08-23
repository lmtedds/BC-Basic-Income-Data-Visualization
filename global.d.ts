// Allow webpack loaders to handle image files while not
// freaking out typescript.
declare module "*.png" {
	const value: any;
	export default value;
}

declare module "*.jpg" {
	const value: any;
	export default value;
}

declare module "*.gif" {
	const value: any;
	export default value;
}

// Allow typescript to handle webpack DefinePlugin's
// variable descriptions.
declare const DEVELOPMENT: string;
