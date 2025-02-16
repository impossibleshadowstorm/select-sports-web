'use client';

import { CrossIcon, UploadIcon } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection
} from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn, formatBytes } from '@/lib/utils';
import { uploadFileToS3 } from '@/lib/utils/s3-operations';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  // onUpload?: (files: File[]) => Promise<void>;
  onUpload?: (urls: string[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps['accept'];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps['maxSize'];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFiles={5}
   */
  maxFiles?: DropzoneProps['maxFiles'];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = { 'image/*': [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange
  });

  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});

  const handleUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    try {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        filesToUpload.forEach((file) => {
          newProgress[file.name] = 0; // Initialize progress
        });
        return newProgress;
      });

      // Upload all files simultaneously
      const uploadedUrls = await Promise.all(
        filesToUpload.map(async (file) => {
          try {
            const fileUrl = await uploadFileToS3(file); // Upload to S3
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 })); // Mark as complete
            return fileUrl;
          } catch (error) {
            console.error('Upload failed for', file.name, error);
            toast.error(`Upload failed: ${file.name}`);
            return null; // Mark failure
          }
        })
      );

      // Filter out failed uploads
      const successfulUploads = uploadedUrls.filter(
        (url): url is string => url !== null
      );

      if (onUpload) {
        if (successfulUploads.length === filesToUpload.length) {
          await onUpload(successfulUploads); // Send all uploaded URLs
        } else {
          console.error('Some files failed to upload.');
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
      toast.error('Cannot upload more than 1 file at a time');
      return;
    }

    if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
      toast.error(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    const newFiles = acceptedFiles
      .filter((file) => file instanceof File)
      .map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );

    setFiles((prevFiles) => [...(prevFiles ?? []), ...newFiles]);

    // Call handleUpload outside of setFiles to ensure latest state is used
    setTimeout(() => {
      handleUpload(newFiles);
    }, 0);

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file }) => {
        toast.error(`File ${file.name} was rejected`);
      });
    }

    // handleUpload(newFiles); // Upload to S3
  };

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

  return (
    <div className='relative flex flex-col gap-6 overflow-hidden'>
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
              isDragActive && 'border-muted-foreground/50',
              isDisabled && 'pointer-events-none opacity-60',
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className='font-medium text-muted-foreground'>
                Drop the files here
              </p>
            ) : (
              <p className='font-medium text-muted-foreground'>
                Drag {'&'} drop files here, or click to select files
              </p>
            )}
          </div>
        )}
      </Dropzone>

      {files?.length ? (
        <ScrollArea className='h-fit w-full px-3'>
          <div className='max-h-48 space-y-4'>
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={uploadProgress[file.name] ?? 0}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  const imageSrc =
    typeof file === 'string'
      ? file
      : isFileWithPreview(file)
        ? file.preview
        : undefined;
  return (
    <div className='relative flex items-center space-x-4'>
      <div className='flex flex-1 space-x-4'>
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={file?.name || imageSrc.split('/').pop() || 'Uploaded image'}
            width={48}
            height={48}
            loading='lazy'
            className='aspect-square shrink-0 rounded-md object-cover'
          />
        )}
        <div className='flex w-full flex-col gap-2'>
          <p className='line-clamp-1 text-sm font-medium text-foreground/80'>
            {file.name}
          </p>
          <p className='text-xs text-muted-foreground'>
            {formatBytes(file.size)}
          </p>
          {progress !== undefined && <Progress value={progress} />}
        </div>
      </div>
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='size-7'
        onClick={onRemove}
      >
        <CrossIcon className='size-4' aria-hidden='true' />
        <span className='sr-only'>Remove file</span>
      </Button>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}
