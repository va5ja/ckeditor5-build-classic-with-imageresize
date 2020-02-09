import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Model from '@ckeditor/ckeditor5-ui/src/model';

export default class InsertImage extends Plugin {
	constructor( editor ) {
		super( editor );

		this.insertImageAdapter = null;

		// the logic that retrieves the items will populate this collection
		this.items = new Collection();
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
				class: editor.config.get( 'insertimage.class' ) || 'insert-image-view'
			} );

			dropdownView.buttonView.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true
			} );

			// callback executed once the buton is clicked
			dropdownView.buttonView.on( 'execute', () => {
				this.insertImageAdapter = this.createInsertImageAdapter( this.items );
				this.insertImageAdapter.addItems();
			} );

			dropdownView.panelView.on( 'render', () => {
				this.insertImageAdapter.addListeners( dropdownView.panelView.element );
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
			addListToDropdown( dropdownView, this.items );

			return dropdownView;
		} );
	}
}

