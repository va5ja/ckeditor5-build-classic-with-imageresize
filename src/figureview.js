import View from '@ckeditor/ckeditor5-ui/src/view';

import './figure.css';

/**
 * The figure view class.
 *
 * @extends module:ui/view~View
 */
export default class FigureView extends View {
	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		/**
		 * The src of the img.
		 *
		 * @observable
		 * @member {String} #src
		 */
		this.set( 'src', '' );

		/**
		 * The alt of the img.
		 *
		 * @observable
		 * @member {String} #alt
		 */
		this.set( 'alt', '' );

		this.setTemplate( {
			tag: 'figure',
			children: [
				{
					tag: 'img',
					attributes: {
						src: bind.to( 'src' ),
						alt: bind.to( 'alt' ),
						class: 'ck-figure-img'
					},
				}
			],
			attributes: {
				class: [
					'ck',
					'ck-figure'
				],
			},
		} );
	}
}
