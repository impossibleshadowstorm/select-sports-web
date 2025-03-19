'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { authorizedGet } from '@/lib/api-client';
import { useEffect, useState } from 'react';

export function UserNav() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await authorizedGet('/user', session?.user?.id!);
        const name = await res.data.name;
        setUserName(name || 'Guest User');
      } catch (error) {
        console.error(error); // eslint-disable-line
      }
    }
    fetchUser();
  }, []); // eslint-disable-line

  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    const initials = words
      .filter((n) => n.length > 0) // Remove empty strings
      .map((n) => n[0].toUpperCase()) // Take first letter
      .slice(0, 2) // Get first two letters
      .join('');
    return initials;
  };

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={session.user?.image ?? ''}
                alt={session.user?.name ?? ''}
              />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {session.user?.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href='/dashboard/profile' passHref>
              <DropdownMenuItem>
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <Link href='/dashboard/security' passHref>
              <DropdownMenuItem>
                <span>Security</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            {/* 
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
