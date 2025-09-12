import pdf from 'pdf-parse';

export interface ProcessedBook {
    title: string,
    passages: string[]
}

export async function processPDF(file: File): Promise<ProcessedBook> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);

    let text = data.text;

    const skipPatterns = [
        /table of contents/i,
        /index/i,
        /preface/i,
        /acknowledgments/i,
        /bibliography/i,
        /references/i,
        /copyright/i,
        /isbn/i,
        /published by/i,
    ];

    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => {
            if(!line) return false;
            if(line.length < 30) return false;
            if(/^\d+$/.test(line)) return false;

            for(const pattern of skipPatterns){
                if(pattern.test(line)) return false;
            }

            return true;
        })

    const passages: string[] = [];
    let currentPassage = '';
    
    for (const line of lines) {
        if (line.length > 100 && currentPassage) {
            passages.push(currentPassage.trim());
            currentPassage = line;
        }else {
            currentPassage += (currentPassage ? ' ' : '') + line;

            if (currentPassage.length > 200) {
                passages.push(currentPassage.trim());
                currentPassage = '';
            }
        }
    }
    
    if (currentPassage.trim()) {
        passages.push(currentPassage.trim());
    }
    
    const qualityPassages = passages.filter(passage => {
        if (passage.length < 100) return false;
        
        if (passage === passage.toUpperCase()) return false;
        
        if (!passage.includes('.')) return false;
        
        return true;
    });
    
    return {
        title: file.name.replace('.pdf', ''),
        passages: qualityPassages.slice(0, 50) 
    };
    

}