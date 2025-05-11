import React, {useEffect, useRef} from 'react'

function DrawingLayer ({selectedImage})  {
    const canvasRef = useRef();
    
    useEffect(() => {
        if (selectedImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            const canvasWidth = 600;
            const canvasHeight = 300;

            img.onload = () => {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                // ctx.drawImage(img, 0, 0);

                const imgAspect = img.width / img.height;
                const canvasAspect = canvasWidth / canvasHeight;

                let drawWidth, drawHeight;

                if (imgAspect > canvasAspect) {
                    drawWidth = canvasWidth;
                    drawHeight = canvasWidth / imgAspect;
                } else {
                    drawHeight = canvasHeight;
                    drawWidth = canvasHeight * imgAspect;
                }

                ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
            };

            // img.src = `data:image/jpeg;base64,${selectedImage.file}`;
            img.src= selectedImage.row_image;
        } else {
            return;
        }
    }, [selectedImage]);

    return (
        <div>
            <h3>Selected Image</h3>
            <canvas ref={canvasRef} style={{border: '1px solid #ccc'}}/>
        </div>
    );
};

export default DrawingLayer;
