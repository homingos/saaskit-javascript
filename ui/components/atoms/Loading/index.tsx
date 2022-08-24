import styles from './Loading.module.scss';

const Loading = () => {
  return (
    <div>
      <div className={styles.loading}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Loading;
