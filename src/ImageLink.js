import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Position from '@ckeditor/ckeditor5-engine/src/view/position';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';

import './insertimage.css';

export default class ImageLink extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageLink';
	}

	init() {
		const editor = this.editor;
		editor.model.schema.extend( 'image', { allowAttributes: [ 'href' ] } );
		editor.conversion.for( 'upcast' ).add( this.upcastLink() );
		editor.conversion.for( 'upcast' ).add( this.upcastImageLink( 'img' ) );
		editor.conversion.for( 'upcast' ).add( this.upcastImageLink( 'figure' ) );
		editor.conversion.for( 'downcast' ).add( this.downcastImageLink() );
	}

	/**
	 * Returns converter for links that wraps <img> or <figure> elements.
	 *
	 * @returns {Function}
	 */
	upcastLink() {
		return dispatcher => {
			dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
				const viewLink = data.viewItem;
				const imageInLink = Array.from( viewLink.getChildren() ).find( child => child.name === 'img' || child.name === 'figure' );

				if ( imageInLink ) {
					// There's an image (or figure) inside an <a> element - we consume it so it won't be picked up by Link plugin.
					const consumableAttributes = { attributes: [ 'href' ] };

					// Consume the link so the default one will not convert it to $text attribute.
					if ( !conversionApi.consumable.test( viewLink, consumableAttributes ) ) {
						// Might be consumed by something else - ie other converter with priority=highest - a standard check.
						return;
					}

					// Consume 'href' attribute from link element.
					conversionApi.consumable.consume( viewLink, consumableAttributes );
				}
			}, { priority: 'high' } );
		};
	}

	upcastImageLink( elementName ) {
		return dispatcher => {
			dispatcher.on( `element:${ elementName }`, ( evt, data, conversionApi ) => {
				const viewImage = data.viewItem;
				const parent = viewImage.parent;

				// Check only <img>/<figure> that are direct children of a link.
				if ( parent.name === 'a' ) {
					const modelImage = Array.from( data.modelRange.getItems() ).find( item => item.is( 'image' ) );
					const linkHref = parent.getAttribute( 'href' );

					if ( modelImage && linkHref ) {
						// Set the href attribute from link element on model image element.
						conversionApi.writer.setAttribute( 'href', linkHref, modelImage );
					}
				}
			}, { priority: 'normal' } );
		};
	}

	downcastImageLink() {
		return dispatcher => {
			dispatcher.on( 'attribute:href:image', ( evt, data, conversionApi ) => {
				const href = data.attributeNewValue;
				// The image will be already converted - so it will be present in the view.
				const viewImage = conversionApi.mapper.toViewElement( data.item );

				// Below will wrap already converted image by newly created link element.

				// 1. Create empty link element.
				const linkElement = conversionApi.writer.createContainerElement( 'a', { href } );

				// 2. Insert link before associated image.
				conversionApi.writer.insert( Position._createBefore( viewImage ), linkElement );

				// 3. Move whole converted image to a link.
				conversionApi.writer.move( Range._createOn( viewImage ), new Position( linkElement, 0 ) );
			}, { priority: 'normal' } );
		};
	}
}

