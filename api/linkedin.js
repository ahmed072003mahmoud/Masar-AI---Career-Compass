// api/linkedin.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    // التحقق من الرابط
    if (!url || !url.includes('linkedin.com/in/')) {
      return res.status(400).json({ error: 'Invalid LinkedIn URL' });
    }

    // إرسال طلب لجلب الصفحة
    // ملاحظة: LinkedIn يحظر الطلبات الآلية، لذا قد يتطلب هذا وكلاء (Proxies) أو Cookies في بيئة الإنتاج
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // استخراج البيانات
    const profileData = {
      firstName: $('h1').first().text().trim().split(' ')[0] || '',
      lastName: $('h1').first().text().trim().split(' ').slice(1).join(' ') || '',
      headline: $('.text-body-medium').first().text().trim(),
      summary: $('#about ~ .display-flex').text().trim(),
      positions: [],
      education: [],
      skills: []
    };

    // استخراج الخبرات (هذه المحددات تعتمد على هيكلة LinkedIn وقد تتغير)
    $('#experience ~ .pvs-list__outer-container li').each((i, elem) => {
      const title = $(elem).find('.mr1 span').first().text().trim();
      const company = $(elem).find('.t-14 span').eq(1).text().trim();
      if (title) {
        profileData.positions.push({ title, company });
      }
    });

    // استخراج المهارات
    $('.pvs-list__item--with-icon li').each((i, elem) => {
      const skill = $(elem).find('.mr1 span').first().text().trim();
      if (skill) {
         profileData.skills.push({ name: skill });
      }
    });

    // استخراج التعليم
    $('#education ~ .pvs-list__outer-container li').each((i, elem) => {
      const school = $(elem).find('.mr1 span').first().text().trim();
      const degree = $(elem).find('.t-14 span').eq(1).text().trim();
      if (school) {
        profileData.education.push({ school, degree });
      }
    });

    res.json(profileData);
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Failed to fetch LinkedIn data' });
  }
});

module.exports = router;