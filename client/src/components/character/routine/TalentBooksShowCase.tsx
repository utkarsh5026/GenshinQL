import React from "react";
import type { TalentBook } from "@/redux/slices/talent-books";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface TalentBooksShowCaseProps {
  talentBooks: TalentBook[];
}

const TalentBookCard: React.FC<{ iconUrl: string; name: string }> = ({
  iconUrl,
  name,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <Avatar className="w-8 h-8  bg-slate-800">
      {isLoading && <Skeleton className="h-full w-full rounded-full" />}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <AvatarImage
              src={iconUrl}
              onLoad={() => setIsLoading(false)}
              className={isLoading ? "hidden" : ""}
            />
          </TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Avatar>
  );
};

const TalentBooksShowCase: React.FC<TalentBooksShowCaseProps> = ({
  talentBooks,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {talentBooks.map((book) => {
        const { teachingUrl, guideUrl, philosophyUrl, bookName } = book;

        return (
          <div
            key={book.name}
            className="flex flex-row items-center cursor-pointer hover:opacity-80"
          >
            <TalentBookCard
              iconUrl={teachingUrl}
              name={`Teaching of ${bookName}`}
            />
            <div className="ml-2">
              <TalentBookCard
                iconUrl={guideUrl}
                name={`Guide of ${bookName}`}
              />
            </div>
            <div className="ml-2">
              <TalentBookCard
                iconUrl={philosophyUrl}
                name={`Philosophy of ${bookName}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TalentBooksShowCase;
