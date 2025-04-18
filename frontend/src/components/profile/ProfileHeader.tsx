import React from 'react';
import Image from 'next/image';
import { ISellerProfile } from '@/types';

interface ProfileHeaderProps {
  profile: ISellerProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white">
            <Image
              src={profile.profileImage}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-xl mt-2">{profile.title}</p>
            <p className="mt-2 flex items-center gap-2 justify-center md:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {profile.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;