import PageContainer from '@/components/layout/page-container';
import ProfileCreateForm from './profile-create-form';
import { authorizedGet } from '@/lib/api-client';
import { auth } from '@/lib/auth';
import { AvailableStates } from '@prisma/client'; // Import Prisma Enum

type TUserProfileViewPageProps = {
  userId: string;
};

export default async function ProfileViewPage({
  userId
}: TUserProfileViewPageProps) {
  const session = await auth();
  let { data: user } = await authorizedGet(`/user`, session?.user?.id!);
  console.log(user);

  const availableStates = Object.values(AvailableStates);

  return (
    <PageContainer>
      <div className='flex w-full justify-center'>
        <ProfileCreateForm
          initialData={user}
          availableStates={availableStates}
        />
      </div>
    </PageContainer>
  );
}
