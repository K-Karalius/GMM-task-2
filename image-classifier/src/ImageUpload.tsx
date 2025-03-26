import { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles.css';

const ImageUpload: React.FC = () => {
	const [image, setImage] = useState<File | null>(null);
	const [predictedClass, setPredictedClass] = useState<string | null>(null);
	const [classes, setClasses] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchClasses = async () => {
			try {
				const response = await axios.get('http://127.0.0.1:5000/classes');
				setClasses(response.data.classes);
			} catch (error) {
				console.error('Error fetching classes:', error);
				setError('Error fetching class list.');
			}
		};

		fetchClasses();
	}, []);

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setImage(event.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!image) {
			alert('Please select an image!');
			return;
		}

		setLoading(true);
		setPredictedClass(null);
		setError(null);

		const formData = new FormData();
		formData.append('image', image);

		try {
			const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setPredictedClass(response.data.predicted_class);
		} catch (error) {
			console.error('Error uploading image:', error);
			setError('Error uploading the image.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='container'>
			<div className='uploadBox'>
				<h1>Image Classifier</h1>
				<div className='fileInputWrapper'>
					<input type='file' onChange={handleImageChange} className='fileInput' />
				</div>
				<button onClick={handleUpload} className='uploadButton' disabled={loading}>
					{loading ? 'Uploading...' : 'Upload Image'}
				</button>
				{image && <img src={URL.createObjectURL(image)} alt='Uploaded' className='imagePreview' />}
				{predictedClass && <p className='predictedClass'>Predicted Class: {predictedClass}</p>}
				{error && <p className='error'>{error}</p>}
				<h2>Classes List</h2>
				<ul className='classList'>
					{classes.map((className, index) => (
						<li key={index} className='classItem'>
							{className}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default ImageUpload;
