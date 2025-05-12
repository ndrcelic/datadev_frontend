import React, {useEffect, useRef, useState} from 'react';
import api from "../services/api"

function DrawingLayer ({selectedImage, setIsDrawing})  {
    const canvasRef = useRef();
    const [mode, setMode] = useState('u');  // undefined
    
    const [isDrawingBox, setIsDrawingBox] = useState(false)
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);
    const [isImageSelected, setIsImageSelected] = useState(false);

    const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
    const [polyPoints, setPolyPoints] = useState([]);
    const [currentPolyPos, setCurrentPolyPos] = useState(null);
    const isFinishedPolygon = useRef(false);

    const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

    const canvasWidth = 600;
    const canvasHeight = 300;

    const drawing = (box = null, polygon = null, isFinishedPolygon) => {
        if (selectedImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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
                if (polygon && polygon.length > 0) {
                    polygon.forEach(({x, y}) => {
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, 2* Math.PI);
                        ctx.fillStyle = 'blue';
                        ctx.fill();
                    });
                    if (isFinishedPolygon.current) {
                        ctx.beginPath();
                        ctx.moveTo(polygon[0].x, polygon[0].y);

                        polygon.forEach(({x, y}) =>{
                            ctx.lineTo(x, y);
                        });

                        ctx.lineTo(polygon[0].x, polygon[0].y);
                        
                        ctx.strokeStyle = 'blue';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            img.src= selectedImage.row_image;
        } else return;

    }

    useEffect(() => {
        drawing(currentPos, currentPolyPos, isFinishedPolygon);
    }, [selectedImage, currentPos, currentPolyPos])
    
    // useEffect(() => {
    //     if (selectedImage && canvasRef.current) {
    //         const canvas = canvasRef.current;
    //         const ctx = canvas.getContext('2d');
    //         const img = new Image();
            
    //         img.onload = () => {
    //             canvas.width = canvasWidth;
    //             canvas.height = canvasHeight;
    //             ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //             // ctx.drawImage(img, 0, 0);

    //             const imgAspect = img.width / img.height;
    //             const canvasAspect = canvasWidth / canvasHeight;

    //             let drawWidth, drawHeight;

    //             if (imgAspect > canvasAspect) {
    //                 drawWidth = canvasWidth;
    //                 drawHeight = canvasWidth / imgAspect;
    //             } else {
    //                 drawHeight = canvasHeight;
    //                 drawWidth = canvasHeight * imgAspect;
    //             }

    //             ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
    //             setIsImageSelected(true);
    //         };

    //         img.src= selectedImage.row_image;

    //     } else {
    //         return;
    //     }
    // }, [selectedImage]);

    // const addBox = (box = null) => {
    //     if (selectedImage && canvasRef.current) {
    //         const canvas = canvasRef.current;
    //         const ctx = canvas.getContext('2d');
    //         const img = new Image();
    //         const canvasWidth = 600;
    //         const canvasHeight = 300;

    //         img.onload = () => {
    //             canvas.width = canvasWidth;
    //             canvas.height = canvasHeight;
    //             ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //             // ctx.drawImage(img, 0, 0);

    //             const imgAspect = img.width / img.height;
    //             const canvasAspect = canvasWidth / canvasHeight;

    //             let drawWidth, drawHeight;

    //             if (imgAspect > canvasAspect) {
    //                 drawWidth = canvasWidth;
    //                 drawHeight = canvasWidth / imgAspect;
    //             } else {
    //                 drawHeight = canvasHeight;
    //                 drawWidth = canvasHeight * imgAspect;
    //             }

    //             ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
    //             setIsImageSelected(true);

    //             if (box) {
    //                 ctx.strokeStyle = 'red';
    //                 ctx.lineWidth = 1;
    //                 ctx.strokeRect(box.x, box.y, box.width, box.height);
    //             }
    //         };

    //         img.src= selectedImage.row_image;

    //     } else {
    //         return;
    //     }
    // }

    const handleMouseDown = (e) => {
        if (!isImageSelected || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

        const box = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        setStartPos({x, y});
        setIsDrawingBox(true);
    }

    const handleMouseMove = (e) => {
        if (!isImageSelected || !isDrawingBox || !startPos || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

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
        drawing(boxCurrently, null, isFinishedPolygon);
        
    }

    const handleMouseUp = (e) => {
        if (!isImageSelected || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }
        setIsDrawingBox(false);
        drawing(currentPos, null, isFinishedPolygon);
        setSaveButtonEnabled(true);
        setIsDrawing(true);   
    }

    const handleSaveButtonButton = async () => {
        if (mode === 'b') {
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
                setSaveButtonEnabled(false);
                setIsDrawing(false);
                setCurrentPos(null);
                drawing(null, null, isFinishedPolygon);
                setMode('u');
                alert("Box annotations successfully saved!", response.data);
            } catch (error){
                alert("Error during upload annotations!")
            }
        }

        if (mode === 'p' && isFinishedPolygon.current) {
            if (polyPoints.length < 3) return

            const formattedPoints = polyPoints.map(point => [point.x, point.y])

            const payload = {
                "type": "polygon",
                "points": formattedPoints,
            };

            try {
                console.log(`images/${selectedImage.id}/annotations`)
                const response = await api.post(`images/${selectedImage.id}/annotations`, payload);
                setSaveButtonEnabled(false);
                setIsDrawing(false);
                setPolyPoints([]);
                isFinishedPolygon.current = false;
                drawing(null, null, isFinishedPolygon);
                setMode('u');
                alert("Polygon annotations successfully saved!", response.data);
            } catch (error){
                alert("Error during upload annotations!")
            }


        }
    }

    const handlePolygonClick = (e) => {
        if (!isImageSelected || mode === 'b' || isFinishedPolygon.current) return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

        const canvas = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvas.left;
        const y = e.clientY - canvas.top;

        setIsDrawing(true);
        setIsDrawingPolygon(true);

        const newPoints = [...polyPoints, {x, y}]
        setPolyPoints(newPoints)
        drawing(currentPos, newPoints, isFinishedPolygon);

    }

    const handleFinishPolygon = async () => {
        isFinishedPolygon.current = true;
        drawing(currentPos, polyPoints, isFinishedPolygon);
        setSaveButtonEnabled(true);
        setIsDrawingPolygon(false);

    }

    const handleClearAll = async() => {
        setCurrentPos(null);
        setPolyPoints([]);
        drawing(null, null, isFinishedPolygon);
        setSaveButtonEnabled(false);
        setIsDrawing(false);
        setIsDrawingBox(false);
        setIsDrawingPolygon(false);
        setMode('u');
        isFinishedPolygon.current = false;
    }

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' , marginTop: '20px'}}>
                    <button onClick={() => setMode('b')} style = {{ marginLeft: '20px'}} disabled={!selectedImage || saveButtonEnabled || isDrawingPolygon}>Draw Box</button>
                    <button onClick={() => setMode('p')} style = {{ marginLeft: '30px'}} disabled={!selectedImage || isDrawingPolygon || saveButtonEnabled}>Draw Polygon</button>
                    <button onClick={handleClearAll} style = {{ marginLeft: '30px'}}>Clear all</button>
                </div>
                <h3>Selected Image</h3>
                {mode === 'p' ? <label>POLYGON</label> : null}
                {mode === 'b' ? <label>BOX</label> : null}
                <canvas ref={canvasRef} style={{border: '1px solid #ccc'}}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handlePolygonClick}
                />
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' , marginTop: '20px'}}>
                    <button disabled={!saveButtonEnabled} style={{ marginTop: '1rem'}} onClick={handleSaveButtonButton}>
                        Save shape
                    </button>
                    <button disabled={!selectedImage || !isDrawingPolygon || polyPoints.length < 3} style={{ marginLeft: '10rem', marginTop: '1rem'}}
                        onClick={handleFinishPolygon}
                    >Finish and View Polygon</button>
                </div>
                {currentPos &&  (
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
                {polyPoints.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>X point</th>
                                <th>Y point</th>
                            </tr>
                        </thead>
                        <tbody>
                            {polyPoints.map((point, index) =>
                                <tr key={index}>
                                    <td>{point.x.toFixed(4)}</td>
                                    <td>{point.y.toFixed(4)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

            </div>
        </div>
    );
};

export default DrawingLayer;
