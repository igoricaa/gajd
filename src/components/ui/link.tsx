import Link, { LinkProps } from 'next/link';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';

const LinkButton = ({
  children,
  href,
  className,
  variant,
  size,
}: LinkProps & {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) => {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
