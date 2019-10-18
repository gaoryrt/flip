import { g } from 'gelerator'

const maxLenNum = (aNum, bNum) => (aNum > bNum ? aNum : bNum).toString().length

const num2PadNumArr = (num, len) => {
  const padLeftStr = (rawStr, lenNum) => (rawStr.length < lenNum
    ? padLeftStr('0' + rawStr, lenNum)
    : rawStr)
  const str2NumArr = rawStr => rawStr.split('').map(Number)
  return str2NumArr(padLeftStr(num.toString(), len)).reverse()
}

const isstr = any => Object.prototype.toString.call(any) === '[object String]'

export class Flip {
  constructor({
    node,
    from = 0,
    to,
    duration = .5,
    delay,
    easeFn = (pos => (pos /= .5) < 1
                ? .5 * Math.pow(pos, 3)
                : .5 * (Math.pow((pos - 2), 3) + 2)),
    systemArr = [0,1,2,3,4,5,6,7,8,9],
    direct = true,
    separator,
    seperateOnly = 0,
    separateEvery = 3
  }) {
    this.beforeArr = []
    this.afterArr = []
    this.ctnrArr = []
    this.ctnrClientHeight = 0
    this.duration = duration * 1000
    this.systemArr = systemArr
    this.easeFn = easeFn
    this.from = from
    this.to = to || 0
    this.node = node
    this.direct = direct
    this.separator = separator
    this.seperateOnly = seperateOnly
    this.separateEvery = seperateOnly ? 0 : separateEvery
    this._initHTML(maxLenNum(this.from, this.to))
    if (to === undefined) return
    if (delay) setTimeout(() => this.flipTo({to: this.to, direct}), delay * 1000)
    else this.flipTo({to: this.to, direct})
  }

  _initHTML(digits) {
    this.node.classList.add('number-flip')
    this.node.style.position = 'relative'
    this.node.style.overflow = 'hidden'
    for (let i = 0; i < digits; i += 1) {
      const ctnr = g(`ctnr ctnr${i}`)(
        ...this.systemArr.map(i => g('digit')(i)),
        g('digit')(this.systemArr[0])
      )
      ctnr.style.position = 'relative'
      ctnr.style.display = 'inline-block'
      ctnr.style.verticalAlign = 'top'
      this.ctnrArr.unshift(ctnr)
      this.node.appendChild(ctnr)
      this.beforeArr.push(0)
      if (
        !this.separator ||
        (!this.separateEvery && !this.seperateOnly) ||
        i === digits - 1 ||
        ((digits - i) % this.separateEvery != 1 && digits - i - this.seperateOnly != 1)
      ) {
        continue;
      }
      const sprtrStr = isstr(this.separator) ? this.separator : this.separator.shift()
      const sprtr = g('sprtr')(sprtrStr)
      sprtr.style.display = 'inline-block'
      this.node.appendChild(sprtr)
    }
    this.ctnrClientHeight = this.ctnrArr[0].clientHeight
    this.height = this.ctnrClientHeight / (this.systemArr.length + 1)
    this.node.style.height = this.height + 'px'
    for (let d = 0, len = this.ctnrArr.length; d < len; d += 1)
      this._draw({
        digit: d,
        per: 1,
        alter: ~~(this.from / Math.pow(10, d))
      })
  }

  _draw({ per, alter, digit }) {
    if (this.height !== this.ctnrClientHeight / (this.systemArr.length + 1)) {
      this.height = this.ctnrClientHeight / (this.systemArr.length + 1);
    }
    const from = this.beforeArr[digit]
    const modNum = ((per * alter + from) % 10 + 10) % 10
    const translateY = `translateY(${- modNum * this.height}px)`
    this.ctnrArr[digit].style.webkitTransform = translateY
    this.ctnrArr[digit].style.transform = translateY
  }

  flipTo({
    to,
    duration,
    easeFn,
    direct = true
  }) {
    const len = this.ctnrArr.length
    this.beforeArr = num2PadNumArr(this.from, len)
    this.afterArr = num2PadNumArr(to, len)
    const draw = per => {
      let temp = 0
      for (let d = this.ctnrArr.length - 1; d >= 0; d -= 1) {
        let alter = this.afterArr[d] - this.beforeArr[d]
        temp += alter
        const fn = easeFn || this.easeFn
        this._draw({
          digit: d,
          per: fn(per),
          alter: direct ? alter : temp
        })
        temp *= 10
      }
    }
    const start = Date.now()
    const dur = (duration * 1000) || this.duration
    const tick = () => {
      let elapsed = Date.now() - start
      draw(elapsed / dur)
      if (elapsed < dur) requestAnimationFrame(tick)
      else {
        this.from = to
        draw(1)
      }
    }
    window.addEventListener('resize', () => {
      this.height = this.ctnrArr[0].clientHeight / (this.systemArr.length + 1)
      this.node.style.height = this.height + 'px'
      draw(1)
    })
    requestAnimationFrame(tick)
  }
}
