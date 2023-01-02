export function assignHandler(data) {
  try {
    if (!data.handleSuccess && !data.handleFailure) {
      throw 'Please assign success and failure handlers!';
    }
    window.handleSuccess = data.handleSuccess;
    window.handleFailure = data.handleFailure;
  } catch (err) {
    console.log(err);
  }
}
