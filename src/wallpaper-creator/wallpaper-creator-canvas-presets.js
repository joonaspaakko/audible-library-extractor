export default [
	{
		label: 'Wallpaper',
		value: 'wallpaper',
		options: {
			coversPerRow: 14,
			coverAmount: 300,
			paddingSize: 0,
			awpOverlayColorEnabled: true,
			awpOverlayColor: 'rgba(43,43,43, .64)',
			awpBlendMode: 'normal',
			showAuthorAndTitle: false,
			awpGrayscale: false,
			canvas: {
				width: 1920,
				height: 1080,
				background: '#151515',
				alignmentVertical: 'flex-start',
				padding: {
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
				},
				zoomOutputs: false,
				outputScale: 1,
			},
		}
	},
	{
		label: 'Card',
		value: 'card',
		options: {
			coversPerRow: 5,
			coverAmount: 999999,
			paddingSize: 5,
			awpOverlayColorEnabled: false,
			showAuthorAndTitle: false,
			awpGrayscale: false,
			canvas: {
				width: 1000,
				height: 0,
				background: '#fff',
				alignmentVertical: 'flex-start',
				padding: {
					top: 32,
					right: 32,
					bottom: 32,
					left: 32,
				},
				zoomOutputs: true,
				outputScale: 2,
			},
			showFavorites: true,
			showMyRating: true,
		}
	},
];