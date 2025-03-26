import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ImageUpload from './ImageUpload.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ImageUpload />
	</StrictMode>
);
