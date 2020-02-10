/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/buttonview
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import FigureView from './figureview';

/**
 * The button view class.
 *
 *		const view = new FigureButtonView();
 *
 *		view.set( {
 *			label: 'A button',
 *			keystroke: 'Ctrl+B',
 *			tooltip: true,
 *			figure: 'http:://img.url',
 *			withText: true
 *		} );
 *
 *		view.render();
 *
 *		document.body.append( view.element );
 *
 * @extends module:ui/view~View
 * @implements module:ui/button/button~Button
 */
export default class FigureButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.set( 'figure' );

		this.set( 'figureImgAlt' );

		this.figureView = new FigureView();

		this.figureView.extendTemplate( {
			attributes: {
				class: 'ck-button__figure'
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		if ( this.figure ) {
			this.figureView.bind( 'src' ).to( this, 'figure' );
			this.figureView.bind( 'alt' ).to( this, 'figureImgAlt' );
			this.children.add( this.figureView );
		}

		super.render();
	}
}
