function inverseDateFormater(date:string){
    const [d, m, y] = date.split("/")
    if (!d || !m || !y) return date
    return `${y}/${m}/${d}`;
}

export default inverseDateFormater
