import './DescriptionLoading.scss';

export type DescriptionLoadingProps = {
  description: string
}

export default function DescriptionLoading(props: DescriptionLoadingProps) {
  return (
    <div className="loader">
      <div className="loader-inner">{props.description}</div>
    </div>
  );
}