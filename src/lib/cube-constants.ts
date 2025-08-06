export const CUBIE_SIZE = 1;
export const CUBIE_GAP = 0.05;

export const solutionSteps = [
    { title: "Paso 1: Cruz Blanca", explanation: "Forma una cruz en la cara blanca, alineando las aristas con los centros de color.", algorithm: "D R' D' F2" },
    { title: "Paso 2: Esquinas Blancas", explanation: "Completa la primera capa insertando las esquinas blancas en su lugar. Usa el algoritmo R' D' R D.", algorithm: "R' D' R D U' R' D' R D U2 R' D' R D" },
    { title: "Paso 3: Segunda Capa", explanation: "Inserta las aristas de la capa media. Usa U R U' R' U' F' U F para la derecha o U' L' U L U F U' F' para la izquierda.", algorithm: "U R U' R' U' F' U F U' U' L' U L U F U' F'" },
    { title: "Paso 4: Cruz Amarilla", explanation: "Crea una cruz en la cara amarilla. Usa el algoritmo F R U R' U' F' hasta formarla.", algorithm: "F R U R' U' F'" },
    { title: "Paso 5: Orientar Cruz Amarilla", explanation: "Alinea los colores de la cruz amarilla con los centros. Usa R U R' U R U2 R'.", algorithm: "R U R' U R U2 R'" },
    { title: "Paso 6: Permutar Esquinas", explanation: "Coloca las esquinas amarillas en su posición correcta. Usa U R U' L' U R' U' L.", algorithm: "U R U' L' U R' U' L" },
    { title: "Paso 7: Orientar Esquinas", explanation: "Gira las esquinas para finalizar. Usa (R' D' R D) repetidamente por esquina.", algorithm: "R' D' R D R' D' R D U R' D' R D R' D' R D U2 R' D' R D R' D' R D U R' D' R D R' D' R D" }
];

export const faceColors = {
    right: 0xc41e3a, // red
    left: 0xff5800, // orange
    top: 0xffffff, // white
    bottom: 0xffd700, // yellow
    front: 0x009e60, // green
    back: 0x0051ba // blue
};

export const colorMap: { [key: number]: string } = {
    [faceColors.right]: 'red',
    [faceColors.left]: 'orange',
    [faceColors.top]: 'white',
    [faceColors.bottom]: 'yellow',
    [faceColors.front]: 'green',
    [faceColors.back]: 'blue',
};
