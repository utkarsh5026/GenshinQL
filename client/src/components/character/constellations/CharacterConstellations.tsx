import React from 'react';

import { Constellation } from '@/types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table.tsx';
import ListSplitter from '../../utils/ListSplitter.tsx';

interface CharacterConstellationsProps {
  constellations: Constellation[];
}

const CharacterConstellations: React.FC<CharacterConstellationsProps> = ({
  constellations,
}) => {
  return (
    <div className="w-full">
      {/* Existing table view */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {constellations.map((constellation) => (
            <TableRow key={constellation.name}>
              <TableCell className="text-center text-sm">
                <img src={constellation.iconUrl} alt={constellation.name} />
              </TableCell>
              <TableCell className="text-center text-xs">
                {constellation.level}
              </TableCell>
              <TableCell className="text-xs">{constellation.name}</TableCell>
              <TableCell className="text-xs font-normal whitespace-normal break-words">
                <ListSplitter text={constellation.description} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CharacterConstellations;
