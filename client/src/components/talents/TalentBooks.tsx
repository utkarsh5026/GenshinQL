import React from "react";


interface TalentBooksProps {
    books: {
        name: string;
        url: string;
    }[];
}

const TalentBooks: React.FC<TalentBooksProps> = ({books}) => {
    return <div>{books.map((book) => (
        <div key={book.name} className={"grid grid-cols-2"}>
            <img src={book.url} alt={book.name} className="h-12 w-12"/>
            <span className="text-xs font-extralight">{book.name}</span>
        </div>
    ))}</div>
}

export default TalentBooks;