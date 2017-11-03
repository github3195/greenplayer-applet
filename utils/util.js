const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatAge = birthday => {
  if (!birthday) {
    return '未知'
  }
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let date = now.getDate()
  let bir = birthday.split('-')
  if (+bir[1] < +month) {
    return year - bir[0] + '岁'
  } else if (+bir[1] > +month) {
    return year - bir[0] + '岁'
  } else if (+bir[1] === +month) {
    return +bir[2] >= +date ? year - bir[0] + '岁' : year - bir[0] - 1 + '岁'
  }
}

const shortDate = date => {
  if (!date) {
    return '未知'
  }
  return date.replace(/\s[:\d]+$/, '')
}

module.exports = {
  formatTime: formatTime,
  formatAge: formatAge,
  shortDate: shortDate
}
