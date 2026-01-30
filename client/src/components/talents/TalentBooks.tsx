import React from "react";


interface TalentBooksProps {
    books: {
        name: string;
        url: string;
    }[];
}

const TalentBooks: React.FC<TalentBooksProps> = ({books}) => {
    return (
        <div className="flex flex-col gap-2">
            {books.map((book) => (
                <div key={book.name} className="flex items-center gap-3">
                    <img
                        src={book.url}
                        alt={book.name}
                        className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0"
                    />
                    <span className="text-xs md:text-sm font-light text-white/90">
                        {book.name}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default TalentBooks;