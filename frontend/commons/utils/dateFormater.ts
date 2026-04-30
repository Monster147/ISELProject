function dateFormater(date:string){
    const [y, m, d] = date.split("-")
    if (!y || !m || !d) return date
    return `${d}/${m}/${y}`;
}

export default dateFormater
