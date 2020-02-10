import Model from '@ckeditor/ckeditor5-ui/src/model';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';
import ListItemView from '@ckeditor/ckeditor5-ui/src/list/listitemview';
import FigureButtonView from './figurebuttonview';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import './insertimage.css';

export default class InsertImage extends Plugin {
	constructor( editor ) {
		super( editor );

		this.insertImageAdapter = null;

		// the logic that retrieves the items will populate this collection
		this.items = new Collection();

		this.page = 1;

		this.threshold = editor.config.get( 'insertimage.threshold' ) || 80;

		this.loading = false;

		this.hasNextPage = true;
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'InsertImage';
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertImage', locale => {
			const dropdownView = createDropdown( locale );

			dropdownView.set( {
				class: editor.config.get( 'insertimage.class' ) || 'insert-image-dropdown'
			} );

			dropdownView.buttonView.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true
			} );

			dropdownView.on( 'render', () => {
				const panelViewElement = dropdownView.panelView.element;
				panelViewElement.addEventListener( 'scroll', () => {
					if ( this.loading ) {
						return;
					}

					const height = panelViewElement.clientHeight;
					const scrollHeight = panelViewElement.scrollHeight - height;
					const scrollTop = panelViewElement.scrollTop;
					const percent = Math.floor( scrollTop / scrollHeight * 100 );

					if ( percent > this.threshold && this.hasNextPage ) {
						this.page += 1;
						this.loadItems();
					}
				} );
			} );

			// callback executed once the button is clicked
			dropdownView.buttonView.on( 'execute', () => {
				this.items.clear();
				this.page = 1;

				this.insertImageAdapter = this.createInsertImageAdapter();
				this.loadItems();
			} );

			// execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.model.change( writer => {
					const imageElement = writer.createElement( 'image', {
						src: evt.source.itemUrl
					} );

					// insert the image in the current selection location.
					editor.model.insertContent( imageElement, editor.model.document.selection );
				} );

				editor.editing.view.focus();
			} );

			// create a dropdown with a list inside the panel
			const listView = dropdownView.listView = new ListView( locale );

			listView.items.bindTo( this.items ).using( ( { type, model } ) => {
				if ( type === 'figurebutton' ) {
					const listItemView = new ListItemView( locale );
					const buttonView = new FigureButtonView( locale );

					// Bind all model properties to the button view.
					buttonView.bind( ...Object.keys( model ) ).to( model );
					buttonView.delegate( 'execute' ).to( listItemView );

					listItemView.children.add( buttonView );

					return listItemView;
				}
			} );

			dropdownView.panelView.children.add( listView );

			listView.items.delegate( 'execute' ).to( dropdownView );

			return dropdownView;
		} );
	}

	loadItems() {
		this.loading = true;

		this.insertImageAdapter.getItems( this.page, response => {
			this.hasNextPage = response.has_next_page;

			if ( Array.isArray( response.results ) && response.results.length ) {
				response.results.forEach( item => {
					this.items.add( {
						type: 'figurebutton',
						model: new Model( {
							withText: true,
							label: item.title,
							figure: item.thumbnailUrl,
							figureImgAlt: item.imageAlt || '',
							itemUrl: item.imageUrl
						} )
					} );
				} );
			}

			this.loading = false;
		} );
	}
}

