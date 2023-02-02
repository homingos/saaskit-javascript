export function warn (message) {
  const styles = ['color: black', 'background: yellow'].join(';');

  const name = '[ZINGCAM SDK]';

  message = name + ': ' + message;
  console.log('%c%s', styles, message);
}