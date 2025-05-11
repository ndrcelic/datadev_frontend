import React, {useEffect, useRef, useState} from 'react';
import api from "../services/api"

function DrawingLayer ({selectedImage, saveBoxEnabled, setSaveBoxEnabled})  {
    const canvasRef = useRef();
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);
    const [isImageSelected, setIsImageSelected] = useState(false);
    
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
                setIsImageSelected(true);
            };

            img.src= selectedImage.row_image;

        } else {
            return;
        }
    }, [selectedImage]);

    const addBox = (box = null) => {
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
                setIsImageSelected(true);

                if (box) {
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);
                }
            };

            img.src= selectedImage.row_image;

        } else {
            return;
        }
    }

    const handleMouseDown = (e) => {
        if (!isImageSelected) return;

        const box = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        setStartPos({x, y});
        setIsDrawing(true);
    }

    const handleMouseMove = (e) => {
        if (!isImageSelected || !isDrawing || !startPos) return;

        const box = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        
        const width = x - startPos.x;
        const height = y - startPos.y;

        const boxCurrently = {
            x: startPos.x,
            y: startPos.y,
            width,
            height,
        };

        setCurrentPos(boxCurrently);
        addBox(boxCurrently);
        
    }
    const handleMouseUp = (e) => {
        if (!isImageSelected) return;
        setIsDrawing(false);
        addBox(currentPos);
        setSaveBoxEnabled(true);   
    }

    const handleSaveBoxButton = async () => {
        if (!currentPos) return;

        const payload = {
            type: "box",
            x: currentPos.x,
            y: currentPos.y,
            w: currentPos.width,
            h: currentPos.height,
        };

        try {
            console.log(`images/${selectedImage.id}/annotations`)
            const response = await api.post(`images/${selectedImage.id}/annotations`, payload);
            setSaveBoxEnabled(false);
            setCurrentPos(null);
            addBox(null);
            alert("Box annotations successfully saved!", response.data);
        } catch (error){
            alert("Error during upload annotations!")
        } 
    }

    const handlePolygonClick = (e) => {
        if (!isImageSelected) return;

        const box = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
    }

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                <h3>Selected Image</h3>
                <canvas ref={canvasRef} style={{border: '1px solid #ccc'}}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handlePolygonClick}
                />
                {currentPos && (
                    <table style={{ borderCollapse: 'collapse', marginTop: '1rem'}}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '4px 8px' }}><strong>X point: </strong></td>
                                <td style={{ padding: '4px 8px' }}>{currentPos.x}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px 8px' }}><strong>Y point: </strong></td>
                                <td style={{ padding: '4px 8px' }}>{currentPos.y}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px 8px' }}><strong>Width: </strong></td>
                                <td style={{ padding: '4px 8px' }}>{currentPos.width}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px 8px' }}><strong>Height: </strong></td>
                                <td style={{ padding: '4px 8px' }}>{currentPos.height}</td>
                            </tr>
                        </tbody>
                    </table>
                )}

                <button disabled={!saveBoxEnabled} style={{ marginTop: '1rem'}} onClick={handleSaveBoxButton}>
                    Save Box
                </button>
            </div>
        </div>
    );
};

export default DrawingLayer;
